import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    
    if(req.url.includes("authorization")) {
      return next();
    }
    
    if(!req.cookies['wlc_cud'] && !req.cookies['wlc_gud']) {
      throw new HttpException("Missing user's cookie", HttpStatus.UNAUTHORIZED);
    }

    next();
  }
}
