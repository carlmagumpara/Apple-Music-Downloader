function isDev() {
  return (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');
}

export const baseUrl = isDev() ? 'http://localhost:8000/api' : 'https://amdl.carlmagumpara.tech/api';