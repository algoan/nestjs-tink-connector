import { customerMock } from "../../algoan/dto/customer.objects.mock";

import { PayloadDTO } from "./payload.dto";

/**
 * Mock for a payload
 */
export const payloadMock: PayloadDTO = {
  customerId: customerMock.id,
};
