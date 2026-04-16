import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import _ from 'lodash';
import qs from 'qs';

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: any) {}

  transform(value: any, metadata: ArgumentMetadata) {
    let parsedValue = value;

    if (metadata.type === 'query') {
      parsedValue = qs.parse(
        _.map(parsedValue || {}, (innerValue, key) => `${key}=${innerValue}`).join('&'),
      );
    }

    return this.schema.parse(parsedValue);
  }
}
