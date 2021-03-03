package com.fit2cloud.fks.config;

import com.fit2cloud.commons.server.license.DefaultLicenseService;
import com.fit2cloud.commons.utils.GlobalConfigurations;
import io.prometheus.client.exporter.PushGateway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;

/**
 *
 */
@PropertySource(value = {
        "classpath:properties/global.properties",
        "classpath:properties/quartz.properties",
        "file:/opt/fit2cloud/conf/fit2cloud.properties",
}, encoding = "UTF-8", ignoreResourceNotFound = true)
@Configuration
public class CommonConfig {

    @Value("${prometheus.push-gateway.host}")
    private String address;

    @Bean
    public PushGateway pushGateway() {
        return new PushGateway(address);
    }

    @EventListener
    public void initLicense(ContextRefreshedEvent event) {
        if (GlobalConfigurations.isReleaseMode()) {
            System.out.println("init License");
            try {
                ApplicationContext applicationContext = event.getApplicationContext();
                applicationContext.getBean(DefaultLicenseService.class).createLicense();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
