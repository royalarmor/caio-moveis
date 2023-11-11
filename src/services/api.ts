import axios from 'axios';

const api = axios.create({ baseURL: ` http://localhost:3002/` });

// const api = axios.create({ baseURL: `https://caio-moveis-backend.vercel.app/` });

// api.interceptors.request.use(async config => {
//     const token = JSON.parse(localStorage.getItem('@NOAP:SYSTEM') || "{}");
//     if (token) config.headers.Authorization = `Bearer ${token?.token}`;

//     return config;
// });

api.interceptors.response.use(
    response => response,
    error => {
        const errorStatus = error?.response?.status;

        if ((errorStatus >= 500 && errorStatus <= 599)){
            console.log(error);
            //(500 - 599) = Server error responses
            return Promise.reject({ message: "Errro no servidor, por favor, tente novamente ou mais tarde!" });
        } 

        if(error?.code === "ERR_NETWORK")
            return Promise.reject({ message: "Falha ao connectar-se com o servidor, por favor, verifique a sua conexão com a internet" });

        return Promise.reject(error?.response?.data);
    },
);

export default api;