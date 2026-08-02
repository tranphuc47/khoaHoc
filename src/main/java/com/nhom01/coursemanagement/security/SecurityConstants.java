// security/SecurityConstants.java
package com.nhom01.coursemanagement.security;

public class SecurityConstants {
    public static final String SECRET_KEY = "day-la-chuoi-bi-mat-it-nhat-256-bit-doi-lai-truoc-khi-deploy-thuc-te";
    public static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24h
    public static final String HEADER = "Authorization";
    public static final String PREFIX = "Bearer ";
}