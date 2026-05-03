import prisma from "../../lib/prisma";

type Comment = {
  details: string;
  id: number;
};
type Newcomment = {
  details: string;
  user_id: number;
  request_id: number;
};
type RequestComment = {
  id: number;
  date: string;
  details: string;
  user_id: number;
  request_id: number;
  firstname: string;
  lastname: string;
  avatar: string | null;
};

class CommentRepository {
  private static formatDate(value: Date) {
    const year = value.getUTCFullYear();
    const month = `${value.getUTCMonth() + 1}`.padStart(2, "0");
    const day = `${value.getUTCDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // The C of CRUD - Create operation

  async create(newComment: Omit<Newcomment, "id">) {
    const createdComment = await prisma.comment.create({
      data: {
        details: newComment.details,
        userId: newComment.user_id,
        requestId: newComment.request_id,
      },
      select: {
        id: true,
      },
    });

    return createdComment.id;
  }

  // The Rs of CRUD - Read operations
  async read(id: number) {
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: {
        details: true,
      },
    });

    if (!comment) {
      return null;
    }

    return {
      details: comment.details,
      id,
    };
  }

  async update(comment: Comment) {
    const result = await prisma.comment.updateMany({
      where: { id: comment.id },
      data: {
        details: comment.details,
      },
    });

    return result.count;
  }

  async readAll(request_id: number) {
    const comments = await prisma.comment.findMany({
      where: {
        requestId: request_id,
      },
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

    return comments.map(
      (comment): RequestComment => ({
        id: comment.id,
        date: CommentRepository.formatDate(comment.date),
        details: comment.details,
        user_id: comment.userId,
        request_id: comment.requestId,
        firstname: comment.user.firstName,
        lastname: comment.user.lastName,
        avatar: comment.user.avatar,
      }),
    );
  }

  // The D of CRUD - Delete operation
  async delete(id: number) {
    const result = await prisma.comment.deleteMany({
      where: { id },
    });

    return result.count;
  }
}

export default new CommentRepository();
