package names

import (
	"crypto/sha256"
	"fmt"
)

func ForUserAvatar(tgID int64, tgAvatar string) string {
	return fmt.Sprintf("user/%d/%x", tgID, sha256.Sum256([]byte(tgAvatar)))
}
