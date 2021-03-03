package com.fit2cloud.fks.dto.response;

/**
 * Copyright 2020 bejson.com
 */
import java.util.List;

/**
 * Auto-generated: 2020-01-16 21:40:35
 *
 * @author bejson.com (i@bejson.com)
 * @website http://www.bejson.com/java2pojo/
 */
public class Configs {
    private String SERVICE_CIDR;
    private String CLUSTER_CIDR;
    private String nfs;
    private String CLUSTER_NETWORK;
    private String flanneld_image;
    private String flanneld_version;
    private String bin_dir;
    private String ca_dir;
    private String CONTAINER_RUNTIME;
    private String base_dir;
    private String kube_version;
    private String docker_version;
    private String etcd_version;
    private int repo_port;
    private int registry_port;
    private String registry_prefix;
    private String download_path;
    private String file_name;
    private String SANDBOX_IMAGE_NAME;
    private String SANDBOX_VERSION;
    private boolean dns_install;
    private String dns_image;
    private String dns_version;
    private String cluster_proportional_autoscaler_amd64_image;
    private boolean dashboard_install;
    private String dashboard_image;
    private String dashboard_version;
    private String metrics_scraper_image;
    private String metrics_scraper_version;
    private String traefik_version;
    private String traefik_image;
    private String helm_namespace;
    private String helm_cert_cn;
    private String tiller_sa;
    private String tiller_cert_cn;
    private String tiller_image;
    private String tiller_version;
    private String NODE_WITH_MULTIPLE_NETWORKS;
    private String calico_ver;
    private String REGISTRY_ACCOUNT_NAME;
    private String REGISTRY_ACCOUNT_PASSWORD;
    private String IMAGE_PULL_SECRET;
    private String kuberhealthy_image;
    private String kuberhealthy_version;
    private String kuberhealthy_pause;
    private String kuberhealthy_pause_version;
    private String alertmanager_image;
    private String alertmanager_version;
    private String busybox_image;
    private String busybox_version;
    private String node_exporter_image;
    private String node_exporter_version;
    private String prometheus_image;
    private String prometheus_version;
    private String pushgateway_image;
    private String pushgateway_version;
    private String kube_state_metrics_image;
    private String kube_state_metrics_version;
    private String configmap_reload_image;
    private String configmap_reload_version;
    private String grafana_image;
    private String grafana_version;
    private String curl_image;
    private String curl_version;
    private String scope_image;
    private String scope_version;
    private boolean storage_nfs_enabled;
    private String storage_nfs_provisioner_name;
    private String allow_ip;
    private String option;
    private String host;
    private String storage_nfs_server_path;
    private String storage_nfs_server;
    private String local_hostname;
    private String master_model;
    private String worker_model;
    private String region;
    private String vc_username;
    private String vc_password;
    private String vc_host;
    private int vc_port;
    private String provider;
    private String image_ovf_path;
    private String image_vmdk_path;
    private String image_name;
    private List<Zones> zones;
    private String APP_DOMAIN;

    public String getSERVICE_CIDR() {
        return SERVICE_CIDR;
    }

    public void setSERVICE_CIDR(String SERVICE_CIDR) {
        this.SERVICE_CIDR = SERVICE_CIDR;
    }

    public String getCLUSTER_CIDR() {
        return CLUSTER_CIDR;
    }

    public void setCLUSTER_CIDR(String CLUSTER_CIDR) {
        this.CLUSTER_CIDR = CLUSTER_CIDR;
    }

    public String getNfs() {
        return nfs;
    }

    public void setNfs(String nfs) {
        this.nfs = nfs;
    }

    public String getCLUSTER_NETWORK() {
        return CLUSTER_NETWORK;
    }

    public void setCLUSTER_NETWORK(String CLUSTER_NETWORK) {
        this.CLUSTER_NETWORK = CLUSTER_NETWORK;
    }

    public String getFlanneld_image() {
        return flanneld_image;
    }

    public void setFlanneld_image(String flanneld_image) {
        this.flanneld_image = flanneld_image;
    }

    public String getFlanneld_version() {
        return flanneld_version;
    }

    public void setFlanneld_version(String flanneld_version) {
        this.flanneld_version = flanneld_version;
    }

    public String getBin_dir() {
        return bin_dir;
    }

    public void setBin_dir(String bin_dir) {
        this.bin_dir = bin_dir;
    }

    public String getCa_dir() {
        return ca_dir;
    }

    public void setCa_dir(String ca_dir) {
        this.ca_dir = ca_dir;
    }

    public String getCONTAINER_RUNTIME() {
        return CONTAINER_RUNTIME;
    }

    public void setCONTAINER_RUNTIME(String CONTAINER_RUNTIME) {
        this.CONTAINER_RUNTIME = CONTAINER_RUNTIME;
    }

    public String getBase_dir() {
        return base_dir;
    }

    public void setBase_dir(String base_dir) {
        this.base_dir = base_dir;
    }

    public String getKube_version() {
        return kube_version;
    }

    public void setKube_version(String kube_version) {
        this.kube_version = kube_version;
    }

    public String getDocker_version() {
        return docker_version;
    }

    public void setDocker_version(String docker_version) {
        this.docker_version = docker_version;
    }

    public String getEtcd_version() {
        return etcd_version;
    }

    public void setEtcd_version(String etcd_version) {
        this.etcd_version = etcd_version;
    }

    public int getRepo_port() {
        return repo_port;
    }

    public void setRepo_port(int repo_port) {
        this.repo_port = repo_port;
    }

    public int getRegistry_port() {
        return registry_port;
    }

    public void setRegistry_port(int registry_port) {
        this.registry_port = registry_port;
    }

    public String getRegistry_prefix() {
        return registry_prefix;
    }

    public void setRegistry_prefix(String registry_prefix) {
        this.registry_prefix = registry_prefix;
    }

    public String getDownload_path() {
        return download_path;
    }

    public void setDownload_path(String download_path) {
        this.download_path = download_path;
    }

    public String getFile_name() {
        return file_name;
    }

    public void setFile_name(String file_name) {
        this.file_name = file_name;
    }

    public String getSANDBOX_IMAGE_NAME() {
        return SANDBOX_IMAGE_NAME;
    }

    public void setSANDBOX_IMAGE_NAME(String SANDBOX_IMAGE_NAME) {
        this.SANDBOX_IMAGE_NAME = SANDBOX_IMAGE_NAME;
    }

    public String getSANDBOX_VERSION() {
        return SANDBOX_VERSION;
    }

    public void setSANDBOX_VERSION(String SANDBOX_VERSION) {
        this.SANDBOX_VERSION = SANDBOX_VERSION;
    }

    public boolean isDns_install() {
        return dns_install;
    }

    public void setDns_install(boolean dns_install) {
        this.dns_install = dns_install;
    }

    public String getDns_image() {
        return dns_image;
    }

    public void setDns_image(String dns_image) {
        this.dns_image = dns_image;
    }

    public String getDns_version() {
        return dns_version;
    }

    public void setDns_version(String dns_version) {
        this.dns_version = dns_version;
    }

    public String getCluster_proportional_autoscaler_amd64_image() {
        return cluster_proportional_autoscaler_amd64_image;
    }

    public void setCluster_proportional_autoscaler_amd64_image(String cluster_proportional_autoscaler_amd64_image) {
        this.cluster_proportional_autoscaler_amd64_image = cluster_proportional_autoscaler_amd64_image;
    }

    public boolean isDashboard_install() {
        return dashboard_install;
    }

    public void setDashboard_install(boolean dashboard_install) {
        this.dashboard_install = dashboard_install;
    }

    public String getDashboard_image() {
        return dashboard_image;
    }

    public void setDashboard_image(String dashboard_image) {
        this.dashboard_image = dashboard_image;
    }

    public String getDashboard_version() {
        return dashboard_version;
    }

    public void setDashboard_version(String dashboard_version) {
        this.dashboard_version = dashboard_version;
    }

    public String getMetrics_scraper_image() {
        return metrics_scraper_image;
    }

    public void setMetrics_scraper_image(String metrics_scraper_image) {
        this.metrics_scraper_image = metrics_scraper_image;
    }

    public String getMetrics_scraper_version() {
        return metrics_scraper_version;
    }

    public void setMetrics_scraper_version(String metrics_scraper_version) {
        this.metrics_scraper_version = metrics_scraper_version;
    }

    public String getTraefik_version() {
        return traefik_version;
    }

    public void setTraefik_version(String traefik_version) {
        this.traefik_version = traefik_version;
    }

    public String getTraefik_image() {
        return traefik_image;
    }

    public void setTraefik_image(String traefik_image) {
        this.traefik_image = traefik_image;
    }

    public String getHelm_namespace() {
        return helm_namespace;
    }

    public void setHelm_namespace(String helm_namespace) {
        this.helm_namespace = helm_namespace;
    }

    public String getHelm_cert_cn() {
        return helm_cert_cn;
    }

    public void setHelm_cert_cn(String helm_cert_cn) {
        this.helm_cert_cn = helm_cert_cn;
    }

    public String getTiller_sa() {
        return tiller_sa;
    }

    public void setTiller_sa(String tiller_sa) {
        this.tiller_sa = tiller_sa;
    }

    public String getTiller_cert_cn() {
        return tiller_cert_cn;
    }

    public void setTiller_cert_cn(String tiller_cert_cn) {
        this.tiller_cert_cn = tiller_cert_cn;
    }

    public String getTiller_image() {
        return tiller_image;
    }

    public void setTiller_image(String tiller_image) {
        this.tiller_image = tiller_image;
    }

    public String getTiller_version() {
        return tiller_version;
    }

    public void setTiller_version(String tiller_version) {
        this.tiller_version = tiller_version;
    }

    public String getNODE_WITH_MULTIPLE_NETWORKS() {
        return NODE_WITH_MULTIPLE_NETWORKS;
    }

    public void setNODE_WITH_MULTIPLE_NETWORKS(String NODE_WITH_MULTIPLE_NETWORKS) {
        this.NODE_WITH_MULTIPLE_NETWORKS = NODE_WITH_MULTIPLE_NETWORKS;
    }

    public String getCalico_ver() {
        return calico_ver;
    }

    public void setCalico_ver(String calico_ver) {
        this.calico_ver = calico_ver;
    }

    public String getREGISTRY_ACCOUNT_NAME() {
        return REGISTRY_ACCOUNT_NAME;
    }

    public void setREGISTRY_ACCOUNT_NAME(String REGISTRY_ACCOUNT_NAME) {
        this.REGISTRY_ACCOUNT_NAME = REGISTRY_ACCOUNT_NAME;
    }

    public String getREGISTRY_ACCOUNT_PASSWORD() {
        return REGISTRY_ACCOUNT_PASSWORD;
    }

    public void setREGISTRY_ACCOUNT_PASSWORD(String REGISTRY_ACCOUNT_PASSWORD) {
        this.REGISTRY_ACCOUNT_PASSWORD = REGISTRY_ACCOUNT_PASSWORD;
    }

    public String getIMAGE_PULL_SECRET() {
        return IMAGE_PULL_SECRET;
    }

    public void setIMAGE_PULL_SECRET(String IMAGE_PULL_SECRET) {
        this.IMAGE_PULL_SECRET = IMAGE_PULL_SECRET;
    }

    public String getKuberhealthy_image() {
        return kuberhealthy_image;
    }

    public void setKuberhealthy_image(String kuberhealthy_image) {
        this.kuberhealthy_image = kuberhealthy_image;
    }

    public String getKuberhealthy_version() {
        return kuberhealthy_version;
    }

    public void setKuberhealthy_version(String kuberhealthy_version) {
        this.kuberhealthy_version = kuberhealthy_version;
    }

    public String getKuberhealthy_pause() {
        return kuberhealthy_pause;
    }

    public void setKuberhealthy_pause(String kuberhealthy_pause) {
        this.kuberhealthy_pause = kuberhealthy_pause;
    }

    public String getKuberhealthy_pause_version() {
        return kuberhealthy_pause_version;
    }

    public void setKuberhealthy_pause_version(String kuberhealthy_pause_version) {
        this.kuberhealthy_pause_version = kuberhealthy_pause_version;
    }

    public String getAlertmanager_image() {
        return alertmanager_image;
    }

    public void setAlertmanager_image(String alertmanager_image) {
        this.alertmanager_image = alertmanager_image;
    }

    public String getAlertmanager_version() {
        return alertmanager_version;
    }

    public void setAlertmanager_version(String alertmanager_version) {
        this.alertmanager_version = alertmanager_version;
    }

    public String getBusybox_image() {
        return busybox_image;
    }

    public void setBusybox_image(String busybox_image) {
        this.busybox_image = busybox_image;
    }

    public String getBusybox_version() {
        return busybox_version;
    }

    public void setBusybox_version(String busybox_version) {
        this.busybox_version = busybox_version;
    }

    public String getNode_exporter_image() {
        return node_exporter_image;
    }

    public void setNode_exporter_image(String node_exporter_image) {
        this.node_exporter_image = node_exporter_image;
    }

    public String getNode_exporter_version() {
        return node_exporter_version;
    }

    public void setNode_exporter_version(String node_exporter_version) {
        this.node_exporter_version = node_exporter_version;
    }

    public String getPrometheus_image() {
        return prometheus_image;
    }

    public void setPrometheus_image(String prometheus_image) {
        this.prometheus_image = prometheus_image;
    }

    public String getPrometheus_version() {
        return prometheus_version;
    }

    public void setPrometheus_version(String prometheus_version) {
        this.prometheus_version = prometheus_version;
    }

    public String getPushgateway_image() {
        return pushgateway_image;
    }

    public void setPushgateway_image(String pushgateway_image) {
        this.pushgateway_image = pushgateway_image;
    }

    public String getPushgateway_version() {
        return pushgateway_version;
    }

    public void setPushgateway_version(String pushgateway_version) {
        this.pushgateway_version = pushgateway_version;
    }

    public String getKube_state_metrics_image() {
        return kube_state_metrics_image;
    }

    public void setKube_state_metrics_image(String kube_state_metrics_image) {
        this.kube_state_metrics_image = kube_state_metrics_image;
    }

    public String getKube_state_metrics_version() {
        return kube_state_metrics_version;
    }

    public void setKube_state_metrics_version(String kube_state_metrics_version) {
        this.kube_state_metrics_version = kube_state_metrics_version;
    }

    public String getConfigmap_reload_image() {
        return configmap_reload_image;
    }

    public void setConfigmap_reload_image(String configmap_reload_image) {
        this.configmap_reload_image = configmap_reload_image;
    }

    public String getConfigmap_reload_version() {
        return configmap_reload_version;
    }

    public void setConfigmap_reload_version(String configmap_reload_version) {
        this.configmap_reload_version = configmap_reload_version;
    }

    public String getGrafana_image() {
        return grafana_image;
    }

    public void setGrafana_image(String grafana_image) {
        this.grafana_image = grafana_image;
    }

    public String getGrafana_version() {
        return grafana_version;
    }

    public void setGrafana_version(String grafana_version) {
        this.grafana_version = grafana_version;
    }

    public String getCurl_image() {
        return curl_image;
    }

    public void setCurl_image(String curl_image) {
        this.curl_image = curl_image;
    }

    public String getCurl_version() {
        return curl_version;
    }

    public void setCurl_version(String curl_version) {
        this.curl_version = curl_version;
    }

    public String getScope_image() {
        return scope_image;
    }

    public void setScope_image(String scope_image) {
        this.scope_image = scope_image;
    }

    public String getScope_version() {
        return scope_version;
    }

    public void setScope_version(String scope_version) {
        this.scope_version = scope_version;
    }

    public boolean isStorage_nfs_enabled() {
        return storage_nfs_enabled;
    }

    public void setStorage_nfs_enabled(boolean storage_nfs_enabled) {
        this.storage_nfs_enabled = storage_nfs_enabled;
    }

    public String getStorage_nfs_provisioner_name() {
        return storage_nfs_provisioner_name;
    }

    public void setStorage_nfs_provisioner_name(String storage_nfs_provisioner_name) {
        this.storage_nfs_provisioner_name = storage_nfs_provisioner_name;
    }

    public String getAllow_ip() {
        return allow_ip;
    }

    public void setAllow_ip(String allow_ip) {
        this.allow_ip = allow_ip;
    }

    public String getOption() {
        return option;
    }

    public void setOption(String option) {
        this.option = option;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getStorage_nfs_server_path() {
        return storage_nfs_server_path;
    }

    public void setStorage_nfs_server_path(String storage_nfs_server_path) {
        this.storage_nfs_server_path = storage_nfs_server_path;
    }

    public String getStorage_nfs_server() {
        return storage_nfs_server;
    }

    public void setStorage_nfs_server(String storage_nfs_server) {
        this.storage_nfs_server = storage_nfs_server;
    }

    public String getLocal_hostname() {
        return local_hostname;
    }

    public void setLocal_hostname(String local_hostname) {
        this.local_hostname = local_hostname;
    }

    public String getMaster_model() {
        return master_model;
    }

    public void setMaster_model(String master_model) {
        this.master_model = master_model;
    }

    public String getWorker_model() {
        return worker_model;
    }

    public void setWorker_model(String worker_model) {
        this.worker_model = worker_model;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getVc_username() {
        return vc_username;
    }

    public void setVc_username(String vc_username) {
        this.vc_username = vc_username;
    }

    public String getVc_password() {
        return vc_password;
    }

    public void setVc_password(String vc_password) {
        this.vc_password = vc_password;
    }

    public String getVc_host() {
        return vc_host;
    }

    public void setVc_host(String vc_host) {
        this.vc_host = vc_host;
    }

    public int getVc_port() {
        return vc_port;
    }

    public void setVc_port(int vc_port) {
        this.vc_port = vc_port;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getImage_ovf_path() {
        return image_ovf_path;
    }

    public void setImage_ovf_path(String image_ovf_path) {
        this.image_ovf_path = image_ovf_path;
    }

    public String getImage_vmdk_path() {
        return image_vmdk_path;
    }

    public void setImage_vmdk_path(String image_vmdk_path) {
        this.image_vmdk_path = image_vmdk_path;
    }

    public String getImage_name() {
        return image_name;
    }

    public void setImage_name(String image_name) {
        this.image_name = image_name;
    }

    public List<Zones> getZones() {
        return zones;
    }

    public void setZones(List<Zones> zones) {
        this.zones = zones;
    }

    public String getAPP_DOMAIN() {
        return APP_DOMAIN;
    }

    public void setAPP_DOMAIN(String APP_DOMAIN) {
        this.APP_DOMAIN = APP_DOMAIN;
    }
}
