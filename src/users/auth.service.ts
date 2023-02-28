import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    // See if email is in use
    const users = await this.userService.findByEmail(email);

    if (users.length) throw new BadRequestException('Email already exist.');

    // Hash the user password
    // Generate a salt
    // Hash the salt and password together
    // Join the hashed result and the salt together
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const passwordHashed = salt + '.' + hash.toString('hex');

    // Create a new user and save it
    const user = await this.userService.create(email, passwordHashed);

    // return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.findByEmail(email);

    if (!user) throw new BadRequestException('User not found.');

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash != hash.toString('hex'))
      throw new BadRequestException('Invalid password.');

    return user;
  }
}
