import prisma from "../../lib/prisma";

type User = {
  id: number;
  firstname: string;
  lastname: string;
  birthday: string;
  avatar?: string | null;
  email: string;
  hashed_password: string;
  role_id?: number | null;
};
type UserToken = {
  id: number;
  firstname: string;
  lastname: string;
  birthday: string;
  avatar: string;
  email: string;
  hashed_password: string;
};

class UserRepository {
  private static formatDate(value: Date) {
    const year = value.getUTCFullYear();
    const month = `${value.getUTCMonth() + 1}`.padStart(2, "0");
    const day = `${value.getUTCDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private static toUserRecord(user: {
    id: number;
    firstName: string;
    lastName: string;
    birthday: Date;
    avatar: string | null;
    email: string;
    hashedPassword: string;
    roleId: number | null;
  }): User {
    return {
      id: user.id,
      firstname: user.firstName,
      lastname: user.lastName,
      birthday: UserRepository.formatDate(user.birthday),
      avatar: user.avatar,
      email: user.email,
      hashed_password: user.hashedPassword,
      role_id: user.roleId,
    };
  }

  // The C of CRUD - Create operation

  async create(user: Omit<User, "id">) {
    const createdUser = await prisma.user.create({
      data: {
        firstName: user.firstname,
        lastName: user.lastname,
        birthday: new Date(user.birthday),
        email: user.email,
        hashedPassword: user.hashed_password,
      },
      select: {
        id: true,
      },
    });

    return createdUser.id;
  }

  // The Rs of CRUD - Read operations

  async read(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return UserRepository.toUserRecord(user);
  }

  async readAll() {
    const users = await prisma.user.findMany();

    return users.map(UserRepository.toUserRecord);
  }

  async readByEmailWithPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return UserRepository.toUserRecord(user) as UserToken;
  }

  // The U of CRUD - Update operation
  // TODO: Implement the update operation to modify an existing item
  // async update(item: Item) {
  //   ...
  // }

  async update(user: User) {
    const result = await prisma.user.updateMany({
      where: { id: user.id },
      data: {
        firstName: user.firstname,
        lastName: user.lastname,
        birthday: new Date(user.birthday),
      },
    });

    return result.count;
  }

  async createAvatar(userId: number, avatarPath: string) {
    const result = await prisma.user.updateMany({
      where: { id: userId },
      data: { avatar: avatarPath },
    });

    return result.count;
  }

  // The D of CRUD - Delete operation
  // TODO: Implement the delete operation to remove an item by its ID

  async delete(id: number) {
    const result = await prisma.user.deleteMany({
      where: { id },
    });

    return result.count;
  }
}

export default new UserRepository();
