package com.fit2cloud.fks.common.constants;

public class PermissionConstants {

    //start USER相关权限
    public static final String USER_READ = "USER:READ";
    public static final String USER_CREATE = "USER:READ+CREATE";
    public static final String USER_EDIT = "USER:READ+EDIT";
    public static final String USER_ADD_ROLE = "USER:READ+ADD_ROLE";
    public static final String USER_DELETE = "USER:READ+DELETE";
    public static final String USER_RESET_PASSWORD = "USER:READ+RESET_PASSWORD";
    public static final String USER_DISABLED = "USER:READ+DISABLED";
    public static final String USER_IMPORT = "USER:READ+IMPORT";
    public static final String USER_KEY_READ = "USER:READ+USER_KEY:READ";
    public static final String USER_KEY_EDIT = "USER:READ+USER_KEY:READ+EDIT";
    //end  user相关权限


    //start role相关权限
    public static final String ROLE_READ = "ROLE:READ";
    public static final String ROLE_CREATE = "ROLE:READ+CREATE";
    public static final String ROLE_EDIT = "ROLE:READ+EDIT";
    public static final String ROLE_DELETE = "ROLE:READ+DELETE";
    //end  role相关权限

    //start workspace相关权限
    public static final String WORKSPACE_READ = "WORKSPACE:READ";
    public static final String WORKSPACE_CREATE = "WORKSPACE:READ+CREATE";
    public static final String WORKSPACE_EDIT = "WORKSPACE:READ+EDIT";
    public static final String WORKSPACE_DELETE = "WORKSPACE:READ+DELETE";
    //end  workspace相关权限

    // start Organization相关权限
    public static final String ORGANIZATION_READ = "ORGANIZATION:READ";
    public static final String ORGANIZATION_CREATE = "ORGANIZATION:READ+CREATE";
    public static final String ORGANIZATION_EDIT = "ORGANIZATION:READ+EDIT";
    public static final String ORGANIZATION_DELETE = "ORGANIZATION:READ+DELETE";
    //end  workspace相关权限

    //start 云账号相关权限
    public static final String CLOUD_ACCOUNT_READ = "CLOUD_ACCOUNT:READ";
    public static final String CLOUD_ACCOUNT_CREATE = "CLOUD_ACCOUNT:READ+CREATE";
    public static final String CLOUD_ACCOUNT_EDIT = "CLOUD_ACCOUNT:READ+EDIT";
    public static final String CLOUD_ACCOUNT_DELETE = "CLOUD_ACCOUNT:READ+DELETE";
    public static final String CLOUD_ACCOUNT_SYNC = "CLOUD_ACCOUNT:READ+SYNC";
    public static final String CLOUD_ACCOUNT_VALIDATE = "CLOUD_ACCOUNT:READ+VALIDATE";
    public static final String CLOUD_ACCOUNT_BATCH_DELETE = "CLOUD_ACCOUNT:READ+BATCH_DELETE";
    public static final String CLOUD_ACCOUNT_BATCH_SYNC = "CLOUD_ACCOUNT:READ+BATCH_SYNC";
    public static final String CLOUD_ACCOUNT_GRANT = "CLOUD_SERVER:READ+GRANT";
    //end  云账号相关权限

    //start 云租户相关权限
    public static final String CLOUD_TENANT_READ = "CLOUD_TENANT:READ";
    public static final String CLOUD_TENANT_EDIT = "CLOUD_TENANT:READ+EDIT";
    public static final String CLOUD_TENANT_SYNC = "CLOUD_TENANT:READ+SYNC";
    //end  云租户相关权限

    // start 标签相关权限
    public static final String TAG_READ = "TAG:READ";
    public static final String TAG_CREATE = "TAG:READ+CREATE";
    public static final String TAG_EDIT = "TAG:READ+EDIT";
    public static final String TAG_DELETE = "TAG:READ+DELETE";
    public static final String TAG_VALUE_READ = "TAG:READ+TAG_VALUE:READ";
    public static final String TAG_VALUE_CREATE = "TAG:READ+TAG_VALUE:READ+CREATE";
    public static final String TAG_VALUE_EDIT = "TAG:READ+TAG_VALUE:READ+EDIT";
    public static final String TAG_VALUE_DELETE = "TAG:READ+TAG_VALUE:READ+DELETE";
    public static final String TAG_VALUE_IMPORT = "TAG:READ+TAG_VALUE:READ+IMPORT";
    // end 标签相关权限

    //start 插件管理
    public static final String PLUGIN_READ = "PLUGIN:READ";
    //end 插件管理

    // start 系统日志权限
    public static final String SYSTEM_LOG_READ = "SYSTEM_LOG:READ";
    public static final String SYSTEM_LOG_KEEP_MONTH_UPDATE = "SYSTEM_LOG:READ+KEEP_MONTH_UPDATE";
    // end 系统日志权限

    // start UI设置
    public static final String KEYCLOAK_SETTING_READ = "KEYCLOAK_SETTING:READ";
    public static final String KEYCLOAK_SETTING_SYNC = "KEYCLOAK_SETTING:SYNC";
    // end 系统日志权限

    //START OS
    public static final String DICTIONARY_OS_READ = "DICTIONARY_OS:READ";
    public static final String DICTIONARY_OS_CREATE = "DICTIONARY_OS:READ+CREATE";
    public static final String DICTIONARY_OS_EDIT = "DICTIONARY_OS:READ+EDIT";
    public static final String DICTIONARY_OS_DELETE = "DICTIONARY_OS:READ+DELETE";
    public static final String DICTIONARY_OS_VERSION_CREATE = "DICTIONARY_OS:READ+VERSION_CREATE";
    public static final String DICTIONARY_OS_VERSION_DELETE = "DICTIONARY_OS:READ+VERSION_DELETE";
    //END OS

    // start mail设置
    public static final String UI_SETTING_READ = "UI_SETTING:READ";
    public static final String UI_SETTING_EDIT = "UI_SETTING:READ+EDIT";
    // end mail设置

    // start mail设置
    public static final String MAIL_SETTING_READ = "MAIL_SETTING:READ";
    public static final String MAIL_SETTING_EDIT = "MAIL_SETTING:READ+EDIT";
    // end mail设置

    // start mail设置
    public static final String LICENSE_READ = "LICENSE:READ";
    public static final String LICENSE_UPDATE = "LICENSE:READ+UPDATE";
    // end mail设置

    // module
    public static final String MODULE_READ = "MODULE:READ";
    public static final String MODULE_ACTIVE = "MODULE:READ+ACTIVE";
    public static final String MODULE_CREATE = "MODULE:READ+CREATE";
    public static final String MODULE_EDIT = "MODULE:READ+EDIT";
    public static final String MODULE_DELETE = "MODULE:READ+DELETE";

    //dashboard
    public static final String DASHBOARD_ACCOUNT = "DASHBOARD:ACCOUNT";
    public static final String DASHBOARD_CLOUD_ACCOUNT = "DASHBOARD:CLOUD_ACCOUNT";
    public static final String DASHBOARD_READ = "DASHBOARD:READ";

    //sys_stats
    public static final String SYS_STATS = "SYS_STATS_READ:READ";

    public static final String CATALOG_PRODUCT_READ = "CATALOG_PRODUCT:READ";
    public static final String CATALOG_PRODUCT_APPLY = "CATALOG_PRODUCT:APPLY";
}
