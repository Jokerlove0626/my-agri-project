// src/lib/axiosInstance.ts
import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError, type AxiosResponse } from 'axios';

// 1. 读取环境变量，并提供一个适合生产环境（Nginx 代理）的默认值
const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// 2. 规范化 baseURL，确保它不以 '/' 结尾
const API_BASE_URL = rawApiBaseUrl.endsWith('/')
  ? rawApiBaseUrl.slice(0, -1)
  : rawApiBaseUrl;

// 3. 创建 Axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL, // 设置基础 URL
  timeout: 15000, // 设置请求超时时间 (例如 15 秒)
  headers: {
    'Content-Type': 'application/json',
    // 你可以在这里添加其他全局请求头，例如认证 Token (如果需要)
    // 'Authorization': `Bearer ${getToken()}`
  }
});

// 4. (可选) 添加请求拦截器 (例如，用于添加 token 或日志)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么，例如添加 token
    // const token = localStorage.getItem('authToken');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params || config.data || '');
    return config;
  },
  (error: AxiosError) => {
    // 对请求错误做些什么
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 5. (可选) 添加响应拦截器 (例如，统一处理错误或数据转换)
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做点什么 (例如，只返回 data 部分)
    // 注意：如果后端 BaseResponse 结构固定，在这里处理可以简化调用处的代码
    // 例如，检查 response.data.code 并抛出错误或直接返回 response.data.data
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status, response.data);

    // 检查后端返回的业务状态码 (假设 code === 0 表示成功)
    if (response.data && typeof response.data.code !== 'undefined' && response.data.code !== 0) {
      console.error(`[API Business Error] Code: ${response.data.code}, Message: ${response.data.message}`, response.data);
      // 将业务错误包装成一个标准的 Error 对象抛出
      const error = new Error(response.data.message || '业务处理失败');
      // 你可以附加额外的信息到 error 对象上
      (error as any).code = response.data.code;
      (error as any).responseData = response.data;
      return Promise.reject(error); // 将其视为 Promise 拒绝
    }
    // 如果 code === 0 或者没有 code 字段，直接返回响应体 data
    return response.data; // **重要：修改此处，直接返回 data 字段**
                               // （这会改变调用处处理响应的方式，不再需要 response.data.data）
                               // 如果你更倾向于在调用处处理，可以返回 response
                               // return response;
  },
  (error: AxiosError) => {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    console.error('[API Response Error]', error.response?.status, error.message, error.config?.url);
    // 可以根据 error.response.status 做更细致的处理
    // 例如： if (error.response?.status === 401) { // 跳转登录页 }
    // 重新包装错误信息，提供更友好的提示
    const errorMessage = error.response
      ? `请求失败，状态码：${error.response.status}`
      : (error.request ? '请求已发出但未收到响应' : `请求设置出错: ${error.message}`);

    // 返回一个被拒绝的 Promise，并带上错误信息
    // 使用原始的 error 对象，以便上层能获取更多信息
    return Promise.reject(error);
    // 或者抛出一个新的错误对象
    // return Promise.reject(new Error(errorMessage));
  }
);

// 导出基础 URL 字符串，供 fetch 使用
export { API_BASE_URL };

// 导出配置好的 Axios 实例
export default axiosInstance;