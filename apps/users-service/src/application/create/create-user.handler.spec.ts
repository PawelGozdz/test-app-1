import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { PinoLogger } from 'nestjs-pino';
import { v4 as uuid } from 'uuid';
import { CreateUserInternalDto } from '@libs/common';
import { IUserCommandRepository, User, UserAlreadyExistsError } from '../../domain';
import { CreateUserHandler } from './create-user.handler';
import { UserEventsService } from '../../user-events.service';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let loggerMock: jest.Mocked<PinoLogger>;
  let userRepository: jest.Mocked<IUserCommandRepository>;
  let userEventsMock: jest.Mocked<UserEventsService>;

  beforeEach(async () => {
    userRepository = createMock();
    loggerMock = createMock();
    userEventsMock = createMock();

    const app = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        {
          provide: IUserCommandRepository,
          useValue: userRepository,
        },
        {
          provide: PinoLogger,
          useValue: loggerMock,
        },
        {
          provide: UserEventsService,
          useValue: userEventsMock,
        },
      ],
    }).compile();

    handler = app.get(CreateUserHandler);
  });

  const userName = 'John';
  const userEmail = 'test@test.com';
  const userId = '123';
  const correlationId = '234';
  
  const dto: CreateUserInternalDto = {
    data: {
      name: userName,
      email: userEmail,
    },
    _metadata: {
      correlationId,
    }
  };


  const userMock = User.create({
    name: dto.data.name,
    email: dto.data.email,
    id: userId,
  });

  describe('Success', () => {
    it('should create new user', async () => {
      // Arrange
      userRepository.getOneByNameOrEmail.mockResolvedValueOnce([]);

      // Act
      const result = await handler.execute(dto);

      // Assert
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userEventsMock.userCreated).toHaveBeenCalledTimes(1);
      expect(result.id).toHaveLength(36);
    });
  });

  describe('failure', () => {
    it('should throw UserAlreadyExistsError if user with given name exists', async () => {
      // Arrange
      const localDto = {
        data: {
          name: userName,
          email: 'different@email.com',
        },
        _metadata: {
          correlationId,
        }
      }
  
      userRepository.getOneByNameOrEmail.mockResolvedValueOnce([userMock]);

      // Act
      const result = await handler.execute(localDto).catch(e => e);

      // Assert
      expect(userRepository.save).toHaveBeenCalledTimes(0);
      expect(userEventsMock.userCreated).toHaveBeenCalledTimes(0);
      expect(result).toBeInstanceOf(UserAlreadyExistsError);
      expect(result.message).toEqual(UserAlreadyExistsError.withName(localDto.data.name).message);
    });

    it('should throw UserAlreadyExistsError if user with given email exists', async () => {
      // Arrange
      const localDto = {
        data: {
          name: 'different name',
          email: userEmail,
        },
        _metadata: {
          correlationId,
        }
      }
  
      userRepository.getOneByNameOrEmail.mockResolvedValueOnce([userMock]);

      // Act
      const result = await handler.execute(localDto).catch(e => e);

      // Assert
      expect(userRepository.save).toHaveBeenCalledTimes(0);
      expect(userEventsMock.userCreated).toHaveBeenCalledTimes(0);
      expect(result).toBeInstanceOf(UserAlreadyExistsError);
      expect(result.message).toEqual(UserAlreadyExistsError.withEmail(localDto.data.email).message);
    });
  });
});
