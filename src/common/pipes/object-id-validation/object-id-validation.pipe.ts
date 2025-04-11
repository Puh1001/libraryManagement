import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { Types } from 'mongoose';

@Injectable()
export class ObjectIdValidationPipe
  implements PipeTransform<string, Types.ObjectId>
{
  transform(value: string, metadata: ArgumentMetadata): Types.ObjectId {
    if (!isMongoId(value)) {
      throw new BadRequestException('Invalid id');
    }

    return Types.ObjectId.createFromHexString(value);
  }
}
