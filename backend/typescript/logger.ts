import * as winston from 'winston';
import * as morgan from 'morgan';
import * as api from './api/SFConf';
import * as colors from 'colors';

if (!process.env.SF_CONF) {
    console.log(colors.red.underline('SF_CONF is not set. Server can\'t start.'));
    console.log(colors.red.underline('Server can\'t start.'));
    process.exit(1);
}
const conf: api.SFConf = require(`${process.env.SF_CONF}`);

export const logger = new (winston.Logger)({
    level: 'debug',
    exitOnError: false,
    transports: [
        new (winston.transports.Console)({
            handleExceptions: true,
            humanReadableUnhandledException: true,
            colorize: true
        }),
        new (winston.transports.File)({
            level: 'debug',
            filename: `${conf.logDir}/server.log`,
            handleExceptions: true,
            humanReadableUnhandledException: true,
            json: true,
            maxsize: (1024 * 1024), // 1MB
            maxFiles: 5,
            colorize: false
        })
    ]
});

class ConsoleLogWriter implements morgan.StreamOptions {
    public write(message: string) {
        logger.info(message);
    }
}

export const logStream: morgan.StreamOptions = new ConsoleLogWriter();