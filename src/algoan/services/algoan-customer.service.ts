import { Injectable } from '@nestjs/common';
import { CustomerUpdateInput } from '../dto/customer.inputs';
import { Customer } from '../dto/customer.objects';
import { AlgoanHttpService } from './algoan-http.service';

/**
 * Service to manage customers
 */
@Injectable()
export class AlgoanCustomerService {
  private readonly apiVersion: string = 'v2';

  constructor(private readonly algoanHttpService: AlgoanHttpService) {}

  /**
   * Get a customer with the given id
   */
  public async getCustomerById(id: string): Promise<Customer> {
    const path: string = `/${this.apiVersion}/customers/${id}`;

    return this.algoanHttpService.get<Customer>(path);
  }

  /**
   * Update a customer with the given id
   */
  public async updateCustomer(id: string, input: CustomerUpdateInput): Promise<Customer> {
    const path: string = `/${this.apiVersion}/customers/${id}`;

    return this.algoanHttpService.patch<Customer, CustomerUpdateInput>(path, input);
  }
}
