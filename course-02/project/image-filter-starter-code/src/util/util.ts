import fs from 'fs';
import Jimp = require('jimp');
import { reject } from 'bluebird';
import { config } from '../config/config';
import path from 'path';

//load the naming convention of the file across the app
const c = config.image;

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string>{
    return new Promise( async (resolve, reject) => {
        try {
            const photo = await Jimp.read(inputURL);
            //One directory up from where utils is.
            const outpath = path.join(__dirname + "/.." + c.subDir + c.imageName + Math.floor(Math.random() * 2000) + c.extension);
            await photo
            .resize(256, 256) // resize
            .quality(60) // set JPEG quality
            .greyscale() // set greyscale
            .write(outpath, (img)=>{
                resolve(outpath);
            });
        } catch (err) {
            //In case there is an issue with the image, the promise will be rejected
            reject(`Failed to fetch the image from ${inputURL}. Please provide a publicly accessible valid image`);
        }
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files:Array<string>){
    for( let file of files) {
        fs.unlinkSync(file);
    }
}