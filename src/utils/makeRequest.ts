import axios from 'axios';

async function makeRequestForLum(path: string, method: 'get' | 'post' | 'put' | 'delete' | 'patch', _body?: object, _token?: string): Promise<any> {
    const serverUri = process.env.SERVER_URI as string;
    
    return new Promise((resolve, reject) => {
        const options = {
            baseURL: serverUri,
            url: path,
            method,

            data: _body ? _body : null,
            headers: _token ? { 'x-access-token': `Bearer ${_token}` } : null
        }
        
        axios.request(options)
            .then((response) => {
                resolve(response.data);
            })
            .catch((err) => {
                reject(err.response.data);
            });
    });
}

export default makeRequestForLum;