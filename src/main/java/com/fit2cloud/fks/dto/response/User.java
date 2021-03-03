/**
  * Copyright 2020 bejson.com 
  */
package com.fit2cloud.fks.dto.response;

/**
 * Auto-generated: 2020-01-16 15:9:37
 *
 * @author bejson.com (i@bejson.com)
 * @website http://www.bejson.com/java2pojo/
 */
public class User {

    private int id;
    private String username;
    private String first_name;
    private String last_name;
    private String email;
    private boolean is_superuser;
    private boolean is_active;
    private String password;
    public void setId(int id) {
         this.id = id;
     }
     public int getId() {
         return id;
     }

    public void setUsername(String username) {
         this.username = username;
     }
     public String getUsername() {
         return username;
     }

    public void setFirst_name(String first_name) {
         this.first_name = first_name;
     }
     public String getFirst_name() {
         return first_name;
     }

    public void setLast_name(String last_name) {
         this.last_name = last_name;
     }
     public String getLast_name() {
         return last_name;
     }

    public void setEmail(String email) {
         this.email = email;
     }
     public String getEmail() {
         return email;
     }

    public void setIs_superuser(boolean is_superuser) {
         this.is_superuser = is_superuser;
     }
     public boolean getIs_superuser() {
         return is_superuser;
     }

    public void setIs_active(boolean is_active) {
         this.is_active = is_active;
     }
     public boolean getIs_active() {
         return is_active;
     }

    public void setPassword(String password) {
         this.password = password;
     }
     public String getPassword() {
         return password;
     }

}