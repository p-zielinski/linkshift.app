import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import _ from 'lodash';
import qs from 'qs';

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: any) {}

  transform(value: any, metadata: ArgumentMetadata) {
    let _value = value;
    if (metadata.type === 'query') {
      _value = qs.parse(
        _.map(_value || {}, (value, key) => `${key}=${value}`).join('&'),
      );
    }
    return this.schema.parse(_value);
  }
}
