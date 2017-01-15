import * as express from 'express';
import { SFConf } from './api/SFConf';
import * as loggerMorgan from 'morgan';
import { logger, logStream } from './logger';

export const conf: SFConf = require(`${process.env.SF_CONF}`);

const server = express();

switch (conf.devMode) {
    case false:
        server.use(loggerMorgan('prod', { stream: logStream }));
        break;
    default:
        server.use(loggerMorgan('dev', { stream: logStream }));
        break;
}


server.listen(conf.httpPort);
logger.info(`Server running in ${conf.devMode ? 'dev' : 'prod'} mode on port ${conf.httpPort}`);
