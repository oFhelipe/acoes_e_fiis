export interface BaseControllerRequestDTO {
  body?: unknown;
  params?: Record<string, any>;
  query?: Record<string, any>;
  headers?: Record<string, any>;
}

export interface BaseControllerResponseDTO {
  status: number;
  headers?: Record<string, string>;
  data?: unknown;
}

export interface BaseController {
  handle: (req: BaseControllerRequestDTO) => Promise<BaseControllerResponseDTO>;
}
