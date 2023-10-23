interface Handlers {
  next: (value: HTTP_Request) => void;
  error: (error: Error) => void;
  complete: () => void;
}

class Observer implements Handlers {
  isUnsubscribed: boolean;
  handlers: Handlers;
  private _unsubscribe: Function | undefined;

  set setUnsubscribe(fn: Function) {
    this._unsubscribe = fn;
  }

  constructor(handlers: Handlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: HTTP_Request) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: Error) {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

class Observable {
  private _subscribe: Function;

  constructor(subscribe: Function) {
    this._subscribe = subscribe;
  }

  static from(values: HTTP_Request[]) {
    return new Observable((observer: Observer) => {
      values.forEach((value: HTTP_Request) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(handlers: Handlers) {
    const observer = new Observer(handlers);

    observer.setUnsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

enum HTTPMethod {
  POST = "POST",
  GET = "GET",
}

type User = {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleted: boolean;
};

const userMock: User = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleted: false,
};

type HTTP_Request = {
  method: HTTPMethod;
  host: string;
  path: string;
  body?: User;
  params: {
    id?: string;
  };
};

const requestsMock: HTTP_Request[] = [
  {
    method: HTTPMethod.POST,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HTTPMethod.GET,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (request: HTTP_Request) => {
  // handling of request
  return { status: HTTP_STATUS_OK };
};
const handleError = (error: Error) => {
  // handling of error
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
} as Handlers);

subscription.unsubscribe();
