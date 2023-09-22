import { Test } from "@nestjs/testing"
import { AuthService } from "./auth.service"
import { UsersService } from "./users.service";
import { User } from "./users.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { async, filter } from "rxjs";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        const users: User[] = [];
        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email)
                return Promise.resolve(filteredUsers)
            },
            create: (email: string, password: string) => {
                const user = { id: users.length, email, password } as User;
                users.push(user)
                return Promise.resolve(user);
            }
        }

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }]
        }).compile();

        service = module.get(AuthService);
    })

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    })

    it('create a new user with a salted and hashed password', async () => {
        const user = await service.signup('avinash@gmail.com', "abcd")

        expect(user.password).not.toEqual('abcd');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    })

    it('throws an error if user signs up with email that is in use', async () => {
        // fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'a', password: '1' } as User])
        await service.signup('as@gmail.com', "abvcd")
        await expect(service.signup('as@gmail.com', "abvcd")).rejects.toThrow(BadRequestException)
    })

    it('throws if signin is called with an unused email', async () => {
        await expect(service.signin("ASd@gmail.com", "avd")).rejects.toThrow(NotFoundException)
    })

    it('throws if an invalid password is provided.', async () => {
        // fakeUsersService.find = () => Promise.resolve([{ email: 'abcd@gmail.com', password: 'abcd' } as User]);
        await service.signup("abcd@gmail.com", "password")

        await expect(service.signin("abcd@gmail.com", "diffpassword")).rejects.toThrow(BadRequestException);
    });

    it('returns a user if correct password is provided', async () => {
        await service.signup('abcd@gmail.com', 'mypassword');

        const user = await service.signin("abcd@gmail.com", "mypassword");
        expect(user).toBeDefined();
    })
})
