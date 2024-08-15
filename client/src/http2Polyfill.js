const http2Constants = {
  HTTP2_HEADER_CONTENT_ENCODING: 'content-encoding',
  HTTP2_HEADER_ACCEPT_ENCODING: 'accept-encoding',
  HTTP2_HEADER_CONTENT_LENGTH: 'content-length',
  HTTP2_HEADER_CONTENT_TYPE: 'content-type',
  HTTP2_HEADER_METHOD: ':method',
  HTTP2_HEADER_PATH: ':path',
  HTTP2_HEADER_STATUS: ':status',
  HTTP2_HEADER_AUTHORITY: ':authority',
  HTTP2_HEADER_HOST: 'host',
};

if (typeof window !== 'undefined') {
  window.http2 = {
    constants: http2Constants
  };
}

export default {
  constants: http2Constants
};