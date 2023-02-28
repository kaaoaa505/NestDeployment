import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Delete,
  Session,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('auth')
@Serialize(UserDto)
// @UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    if (!session) session = {};

    session.userId = null;
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('signin')
  async signUserIn(@Body() body: CreateUserDto, @Session() session: any) {
    if (!session) session = {};

    session.userId = null;
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('isloggedin')
  async isLoggedIn(@Session() session: any) {
    return session.userId ? this.usersService.findOne(session.userId) : false;
  }

  @UseGuards(AuthGuard)
  @Get('whoami')
  async whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Post('signout')
  async signUserOut(@Session() session: any) {
    if (!session) session = {};

    session.userId = null;
  }

  @Get('query')
  async findUserByEmail(@Query('email') email: string) {
    return await this.usersService.findByEmail(email);
  }

  @Get('user/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));

    if (!user) throw new BadRequestException('User not found.');

    return user;
  }

  @Get('users/all')
  async findAllUser() {
    return await this.usersService.findAll();
  }

  @Delete('user/:id')
  async removeUser(@Param('id') id: string) {
    return await this.usersService.remove(parseInt(id));
  }

  @Patch('user/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return await this.usersService.update(parseInt(id), body);
  }

  @Get('colors/:color')
  setColor(@Param('color') color: string, @Session() session: any) {
    session.color = color;
  }

  @Get('color')
  getColor(@Session() session: any) {
    if (!session) session = {};

    return session.color;
  }
}
