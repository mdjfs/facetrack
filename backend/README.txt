
Create a file called "config.json" here

Example configuration:

{
    "secretKey":"XXXX",
    "port":"XXXX",
    "database":{
        "development": {
            "username": "root",
            "password": "i dont know",
            "database": "your database",
            "host": "192.168.0.102",
            "dialect": "mysql"
        },
        "test": {
            "username": "root",
            "password": "i dont know",
            "database": "your database",
            "host": "127.0.0.1",
            "dialect": "postgresql"
        },
        "production": {
            "username": "root",
            "password": "i dont know",
            "database": "your database",
            "host": "127.0.0.1",
            "dialect": "mysql"
        }
    }
}
