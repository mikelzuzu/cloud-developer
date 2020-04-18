import { Router, Request, Response } from 'express';
import { FilteredimageRouter } from './filteredimage/filteredimage.router'

const router: Router = Router();

router.use('/filteredimage', FilteredimageRouter);

router.get('/', async (req: Request, res: Response) => {    
    res.send(`V0`);
});

router.get('/test', async (req: Request, res: Response) => {    
    res.send(`all good`);
});


export const IndexRouter: Router = router;