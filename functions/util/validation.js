//helper methods
const isEmail = email => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
};
const isEmpty = str => {
    if (str.trim() === "") return true;
    else return false;
};

exports.validateSignUpData = data => {
    //create an error object to store all our validation errors
    let errors = {};
    if (isEmpty(data.email)) {
        errors.email = "Must not be empty";
    } else if (!isEmail(data.email)) {
        errors.email = "Please enter a valid email";
    }

    if (isEmpty(data.password)) {
        errors.password = "Must not be empty";
    }
    if (data.password !== data.confirmPassword)
        errors.confirmPassword = "Passwords must match";
    if (isEmpty(data.handle)) {
        errors.handle = "Must not be empty";
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    };
};
exports.validateLoginData = data => {
    let errors = {};
    if (isEmpty(data.email)) errors.email = "Must not be empty";
    if (isEmpty(data.password)) errors.passwords = "Must not be empty";
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    };
};

exports.reduceUserDetails = data => {
    // !isEmpty, all of these are to check if the inputs are empty
    // if they are empty, React will send out an empty string, but
    // we shouldn't insert that into the db.
    // !isEmpty prevents this from happening
    let userDetails = {};
    if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
    if (!isEmpty(data.website.trim())) {
        // if user puts https://website.com cool or else if website.com we add http://
        if (data.website.trim().substring(0, 4) !== "http") {
            userDetails.website = `http://${data.website.trim()}`;
        } else userDetails.website = data.website;
    }

    if (!isEmpty(data.location.trim())) userDetails.location = data.location;
    return userDetails;
};
