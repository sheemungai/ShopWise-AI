import { Request } from 'express';
import { Role } from 'src/users/enums/user-role.enum';

export interface RequestWithUser extends Request {
  user: {
    sub: number;
    role: Role;
  };
}
