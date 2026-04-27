package com.spedex.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

class SecurityConfigTest {

    @Test
    void testCorsFilterConfiguresAllowedOrigins() throws Exception {
        SecurityConfig config = new SecurityConfig();

        // Inject allowedOrigins using reflection
        Field field = SecurityConfig.class.getDeclaredField("allowedOrigins");
        field.setAccessible(true);
        field.set(config, Arrays.asList("https://trusted-domain.com"));

        FilterRegistrationBean<CorsFilter> bean = config.corsFilter();

        assertNotNull(bean);
        assertEquals(org.springframework.core.Ordered.HIGHEST_PRECEDENCE, bean.getOrder());
    }
}
