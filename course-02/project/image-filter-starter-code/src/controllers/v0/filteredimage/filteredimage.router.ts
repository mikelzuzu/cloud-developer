import { Router, Request, Response } from 'express';
import { filterImageFromURL, deleteLocalFiles } from '../../../util/util';
import path from 'path';
import fs from 'fs';
import { config } from '../../../config/config';
import isURL from 'validator/lib/isURL'

const router: Router = Router();

//load the naming convention of the file across the app
const c = config.image;

// GET /filteredimage?image_url={{URL}}
router.get("/", async (req: Request, res: Response) => {
    let { image_url } = req.query;

    if (!image_url) {
        res.status(400).send(`Image URL is required`);
    }

    //validate the query URL
    if (!isURL(image_url)) {
        res.status(400).send('Malformed image URL');
    }

    const filtered_url = filterImageFromURL(image_url);

    /*     filtered_url.catch(error => {
            console.error(error);
            res.status(400).send(error);
        }); */

    filtered_url.then(image => {
        res.status(200).sendFile(image, err => {
            if (err) {
                res.status(400).send("Error sending back the image");
            }
        });
    }).catch(error => {
        console.error(error);
        res.status(400).send(error);
    });

    // deletes any files on the server on finish of the response 
    // in my opinion I do this when the stream and any of its underlying resources have been closed
    // finsh -> end -> close
    res.on('close', function () {
        console.debug('About to close the conection, starting removing images');
        const relativeDir = path.join(__dirname + '../../../../util' + c.subDir);
        console.debug("Path from where images has being removed: " + relativeDir);

        // I decided to check all directory instead just the filename of the one that it was sent in case there was some error in the past and there are residual file to be removed
        fs.readdir(relativeDir, { withFileTypes: true }, (err, files) => {
            if (err) {
                return console.log("Unable to scan the image directory: " + err);
            }
            //just remove the image that we could create following the pattern from config file
            const images =files.filter(item => item.isFile).filter(item => item.name.startsWith(c.imageName)&& item.name.endsWith(c.extension))
                                .map(item => path.join(relativeDir + item.name));
            console.debug("images to be removed" + images);

            deleteLocalFiles(images);
        });

    });

});


export const FilteredimageRouter: Router = router;