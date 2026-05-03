import prisma from "../../lib/prisma";

interface Request {
  id: number;
  date?: string;
  title: string;
  tag1: string;
  tag2: string | null;
  details1: string;
  details2: string | null;
  details3: string | null;
  user_id?: number;
  firstname?: string;
  lastname?: string;
  avatar?: string | null;
}
interface RequestAdd {
  id: number;
  date?: string;
  title: string;
  tag1: string;
  tag2: string | null;
  details1: string;
  details2: string | null;
  details3: string | null;
  user_id: number;
  firstname?: string;
  lastname?: string;
  avatar?: string | null;
}

class RequestRepository {
  private static formatDate(value: Date) {
    const year = value.getUTCFullYear();
    const month = `${value.getUTCMonth() + 1}`.padStart(2, "0");
    const day = `${value.getUTCDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private static toRequestRow(request: {
    id: number;
    date: Date;
    title: string;
    tag1: string;
    tag2: string | null;
    details1: string;
    details2: string | null;
    details3: string | null;
    userId: number;
    user: {
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
  }): RequestAdd {
    return {
      id: request.id,
      date: RequestRepository.formatDate(request.date),
      title: request.title,
      tag1: request.tag1,
      tag2: request.tag2,
      details1: request.details1,
      details2: request.details2,
      details3: request.details3,
      user_id: request.userId,
      firstname: request.user.firstName,
      lastname: request.user.lastName,
      avatar: request.user.avatar,
    };
  }

  async create(request: Omit<RequestAdd, "id">) {
    const createdRequest = await prisma.request.create({
      data: {
        title: request.title,
        tag1: request.tag1,
        tag2: request.tag2 ?? null,
        details1: request.details1,
        details2: request.details2 ?? null,
        details3: request.details3 ?? null,
        userId: request.user_id,
      },
      select: {
        id: true,
      },
    });

    return createdRequest.id;
  }

  async readAll() {
    const requests = await prisma.request.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return requests.map(RequestRepository.toRequestRow);
  }

  //Search a request via id
  async read(id: number) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!request) {
      return null;
    }

    return RequestRepository.toRequestRow(request);
  }

  async update(request: Request) {
    const result = await prisma.request.updateMany({
      where: { id: request.id },
      data: {
        title: request.title,
        tag1: request.tag1,
        tag2: request.tag2 ?? null,
        details1: request.details1,
        details2: request.details2 ?? null,
        details3: request.details3 ?? null,
      },
    });

    return result.count;
  }

  async delete(id: number) {
    const result = await prisma.request.deleteMany({
      where: { id },
    });

    return result.count;
  }
}
export default new RequestRepository();
