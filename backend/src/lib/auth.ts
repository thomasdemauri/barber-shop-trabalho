import argon2 from 'argon2';
export const hashPassword = (value:string) => argon2.hash(value);
export const verifyPassword = (hash:string, value:string) => argon2.verify(hash,value);
