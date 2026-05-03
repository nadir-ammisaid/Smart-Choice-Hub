import prisma from "../../lib/prisma";

type Item = {
  id: number;
  title: string;
  user_id: number;
};

class ItemRepository {
  // The C of CRUD - Create operation

  async create(item: Omit<Item, "id">) {
    await prisma.$executeRaw`insert into item (title, user_id) values (${item.title}, ${item.user_id})`;
    const insertedRows = await prisma.$queryRaw<Array<{ id: number }>>`
      select last_insert_id() as id
    `;

    return insertedRows[0]?.id ?? 0;
  }

  // The Rs of CRUD - Read operations

  async read(id: number) {
    const rows = await prisma.$queryRaw<Item[]>`
      select * from item where id = ${id}
    `;

    return rows[0];
  }

  async readAll() {
    return prisma.$queryRaw<Item[]>`select * from item`;
  }

  // The U of CRUD - Update operation
  // TODO: Implement the update operation to modify an existing item

  // async update(item: Item) {
  //   ...
  // }

  // The D of CRUD - Delete operation
  // TODO: Implement the delete operation to remove an item by its ID

  // async delete(id: number) {
  //   ...
  // }
}

export default new ItemRepository();
