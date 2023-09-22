import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './users.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {

    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({ id, email: 'abcd@gmail.com', password: 'password' } as User)
      },
      find: (email: string) => {
        return Promise.resolve([{
          id: 1, email, password: 'asdf'
        } as User])
      },
      // remove: () => { },
      // update: () => { }
    };

    fakeAuthService = {
      // signup: () => { },
      signin: (email: string, password: string) => {
        return Promise.resolve({
          id: 1, email, password
        } as User)
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.finalAllUsers('abcd@gmail.com')
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual("abcd@gmail.com")
  })

  it('signin updates session object and return user', async () => {
    const session = {
      userId: -10
    }
    const user = await controller.signin(
      {
        email: 'adf@gmail.com',
        password: 'abcd'
      },
      session
    );

    expect(user.id).toEqual(1)
    expect(session.userId).toEqual(1);
  })
});
