package com.fit2cloud.fks.common.utils;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import okhttp3.*;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.net.util.Base64;

import javax.net.ssl.*;
import java.io.IOException;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * @author upeoe
 * @create 2018/7/11 14:58
 */
public class HttpUtil {

    private static final long CONNECT_TIMEOUT = 5;
    private static final long READ_TIMEOUT = 20;
    private static MyTrustManager mMyTrustManager = new MyTrustManager();

    public interface MEDIA_TYPES {
        MediaType TEXT_PLAIN = MediaType.parse("text/plain");
        MediaType JSON = MediaType.parse("application/json; charset=utf-8");
    }

    public enum METHODS {
        GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
    }

    public enum REQUEST_TYPE {
        HTTP, HTTPS
    }

    public static String getBasicAuthToken(String username, String password) {
        return "Basic " + Base64.encodeBase64String((username + ":" + password).getBytes());
    }

    public static OkHttpClient getClient() {
        return getClientBuilder().build();
    }

    public static OkHttpClient getTrustAllClient() throws Exception {
        OkHttpClient.Builder mBuilder = getClientBuilder();
        mBuilder.sslSocketFactory(createSSLSocketFactory(), mMyTrustManager)
                .hostnameVerifier(new TrustAllHostnameVerifier())
                .connectionSpecs(createConnectionSpec());
        return mBuilder.build();
    }

    public static String req(String url) throws Exception {
        return req(url, REQUEST_TYPE.HTTP);
    }

    public static String reqs(String url) throws Exception {
        return req(url, REQUEST_TYPE.HTTPS);
    }

    public static String req(Request req) throws Exception {
        return req(req, REQUEST_TYPE.HTTP);
    }

    public static String reqs(Request req) throws Exception {
        return req(req, REQUEST_TYPE.HTTPS);
    }

    public static Response getResp(Request req) throws Exception {
        return getResp(req, REQUEST_TYPE.HTTP);
    }

    public static Response getHTTPSResp(Request req) throws Exception {
        return getResp(req, REQUEST_TYPE.HTTPS);
    }

    public static class JSONBuilder {
        JSONObject json;

        public JSONBuilder() {
            this.json = new JSONObject();
        }

        public JSONBuilder(Map<String, Object> map) {
            this.json = new JSONObject(map);
        }

        public JSONBuilder put(String key, Object value) {
            this.json.put(key, value);
            return this;
        }

        public JSONObject build() {
            return this.json;
        }

        public String toJSONString() {
            return build().toJSONString();
        }

        @Override
        public String toString() {
            return toJSONString();
        }
    }

    public static class ArrayBuilder {
        JSONArray array;
        Map<String, Object> map;

        public ArrayBuilder() {
            this.array = new JSONArray();
        }

        public ArrayBuilder add(Object o) {
            this.array.add(o);
            return this;
        }

        public ArrayBuilder map() {
            map = new HashMap<>();
            return this;
        }

        public ArrayBuilder mapIn() {
            add(this.map);
            return this;
        }

        public ArrayBuilder mapAdd(String k, Object v) {
            if (null == map) map = new HashMap<>();
            map.put(k, v);
            return this;
        }

        public JSONArray build() {
            return this.array;
        }

        public String toJSONString() {
            return build().toJSONString();
        }

        @Override
        public String toString() {
            return toJSONString();
        }
    }

    /**
     * Get response
     *
     * @param req  request object
     * @param type http or https request
     * @return
     * @throws IOException
     */
    private static Response respHandler(Request req, REQUEST_TYPE type) throws Exception {
        Response resp = null;
        if (REQUEST_TYPE.HTTP.equals(type)) {
            resp = getClient().newCall(req).execute();
        } else if (REQUEST_TYPE.HTTPS.equals(type)) {
            resp = getTrustAllClient().newCall(req).execute();
        }

        if (!resp.isSuccessful()) {
            String body = resp.body().string();
            if (StringUtils.isNotBlank(body)) {
                throw new Exception(body);
            }
            throw new Exception(resp.message());
        }
        return resp;
    }

    private static OkHttpClient.Builder getClientBuilder() {
        return new OkHttpClient.Builder()
                .connectTimeout(CONNECT_TIMEOUT, TimeUnit.SECONDS)
                .readTimeout(READ_TIMEOUT, TimeUnit.SECONDS);
    }

    private static String req(String url, REQUEST_TYPE type) throws Exception {
        return req(new Request.Builder().url(url).build(), type);
    }

    private static String req(Request req, REQUEST_TYPE type) throws Exception {
        return respHandler(req, type).body().string();
    }

    private static Response getResp(Request req, REQUEST_TYPE type) throws Exception {
        return respHandler(req, type);
    }

    private static SSLSocketFactory createSSLSocketFactory() throws Exception {
        SSLContext sc = SSLContext.getInstance("TLSv1.2");
        sc.init(null, new TrustManager[]{mMyTrustManager}, new SecureRandom());
        return sc.getSocketFactory();
    }

    private static List<ConnectionSpec> createConnectionSpec() {
        ConnectionSpec spec = new ConnectionSpec.Builder(ConnectionSpec.MODERN_TLS)
                .tlsVersions(TlsVersion.TLS_1_2)
                .cipherSuites(
                        CipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
                        CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
                        CipherSuite.TLS_DHE_RSA_WITH_AES_128_GCM_SHA256,
                        CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA256,
                        CipherSuite.TLS_RSA_WITH_AES_128_CBC_SHA)
                .build();
        return Collections.singletonList(spec);
    }

    /**
     * Configure trust manager.
     */
    private static class MyTrustManager implements X509TrustManager {
        @Override
        public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
        }

        @Override
        public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
        }

        @Override
        public X509Certificate[] getAcceptedIssuers() {
            return new X509Certificate[]{};
        }
    }

    private static class TrustAllHostnameVerifier implements HostnameVerifier {
        @Override
        public boolean verify(String hostname, SSLSession session) {
            return true;
        }
    }


}
