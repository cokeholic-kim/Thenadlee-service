// 빌드 시 .env(.production) 값이 주입됨. 예) API_URL=/back, FILE_URL=/file
export const API_URL = process.env.REACT_APP_API_URL;
export const FILE_URL = process.env.REACT_APP_FILE_URL;
