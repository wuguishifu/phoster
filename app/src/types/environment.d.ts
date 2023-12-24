declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV?: 'development' | 'production';
            OUTPUT_DIR?: string;
        }
    }
}

export default global;