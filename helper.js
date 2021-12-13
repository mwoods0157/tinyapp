const findUserByEmail = (email, db) => {
    for (const userId in db) {
        const user = db[userId];
        if (user.email === email) {
            return user;
        }
    }
    return null;
};

module.exports.findUserByEmail = findUserByEmail;