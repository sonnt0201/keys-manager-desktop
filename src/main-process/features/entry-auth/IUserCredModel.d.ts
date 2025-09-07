
/**
 * Hold user creds info, include hased password, username, name, etc.
 */
declare interface IUserCredModel {
    name: string; // nickname or full name
    username: string; // Username, should be unique
    password: string; // Hashed password

}