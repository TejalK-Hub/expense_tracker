import { TestBed } from '@angular/core/testing';

import { ReceiptUploadService } from './receipt-upload.service';

describe('ReceiptUploadService', () => {
  let service: ReceiptUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceiptUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
