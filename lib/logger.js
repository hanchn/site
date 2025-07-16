// 日志记录库

class Logger {
    constructor(name = 'App') {
        this.name = name;
    }
    
    _formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] [${this.name}] ${message}`;
    }
    
    info(message) {
        console.log(this._formatMessage('INFO', message));
    }
    
    warn(message) {
        console.warn(this._formatMessage('WARN', message));
    }
    
    error(message) {
        console.error(this._formatMessage('ERROR', message));
    }
    
    debug(message) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this._formatMessage('DEBUG', message));
        }
    }
}

export default Logger;