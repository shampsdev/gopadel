package repo

import "context"

func First[F, T any](f func(context.Context, F) ([]T, error)) func(ctx context.Context, filter F) (T, error) {
	return func(ctx context.Context, filter F) (T, error) {
		var t T
		ts, err := f(ctx, filter)
		if err != nil {
			return t, err
		}
		if len(ts) == 0 {
			return t, ErrNotFound
		}
		return ts[0], nil
	}
}
