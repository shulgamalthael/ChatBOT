// use admin
db.createUser(
    {
        // user: "user",
        // pwd: "12345678",
        roles: [
            {
                role: "userAdminAnyDatabase",
                db: "ChatBOT"
            },
            "readWriteAnyDatabase"
        ]
    }
);
