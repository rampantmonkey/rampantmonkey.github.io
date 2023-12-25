package main

import (
	"bufio"
	"bytes"
	"crypto/hmac"
	"crypto/sha1"
	"encoding/base32"
	"encoding/binary"
	"fmt"
	"io"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"
)

const period = 30

// Code returns the TOTP code and time remaining for the given secret and time.
func Code(secret string) (string, int) {
	t := time.Now().Unix()
	numIntervals := t / period
	remaining := period - (t - (numIntervals * period))
	return hotp(secret, numIntervals), int(remaining)
}

func hotp(secret string, counter int64) string {
	// algorithm from wikipedia (http://en.wikipedia.org/wiki/Google_Authenticator)

	key, err := base32.StdEncoding.DecodeString(secret)
	if err != nil {
		fmt.Println("secret is not base32 encoded.")
		return ""
	}

	message := make([]byte, 8)
	binary.BigEndian.PutUint64(message, uint64(counter))

	mac := hmac.New(sha1.New, key)
	mac.Write(message)
	hash := mac.Sum(nil)

	offset := hash[len(hash)-1] & 0xF
	truncatedHash := hash[offset : offset+4]

	var code int32
	truncatedBytes := bytes.NewBuffer(truncatedHash)
	err = binary.Read(truncatedBytes, binary.BigEndian, &code)
	if err != nil {
		fmt.Printf("could not read HMAC sum: %v\n", err)
		return ""
	}

	code = (code & 0x7FFFFFFF) % 1000000
	converted := strconv.Itoa(int(code))
	padLength := 6 - len(converted)
	return strings.Repeat("0", padLength) + converted
}

type provider struct {
	name   string
	secret string
}

func newProvider(line string) *provider {
	split := strings.SplitN(line, ",", 2)
	if len(split) != 2 {
		return nil
	}

	p := &provider{name: strings.TrimSpace(split[0])}
	secret := strings.TrimSpace(split[1])
	secret = strings.Replace(secret, " ", "", -1)
	secret = strings.ToUpper(secret)
	p.secret = secret

	return p
}

var format string

func main() {
	disp := newDisplay(func(d *display) {
		var namelen int
		d.ps, namelen = parseStdin()
		d.format.prefix = "%-"
		d.format.suffix = "s %s (%ds) "
		d.format.line = d.format.prefix + strconv.Itoa(namelen) + d.format.suffix + "\n"
		d.format.skipLength = len(d.format.prefix) + namelen + 6
	})

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	disp.run()

	for {
		select {
		case <-sigChan:
			return
		}
	}
}

func parseStdin() ([]provider, int) {
	nameLength := 0
	bio := bufio.NewReader(os.Stdin)
	var ps []provider

	for {
		line, hasMoreInLine, err := bio.ReadLine()
		if err == io.EOF {
			break
		}
		if err != nil {
			fmt.Fprintf(os.Stderr, "Could not read from stdin: %v\n", err)
			os.Exit(1)
		}
		if hasMoreInLine {
			fmt.Fprintf(os.Stderr, "Line too long: %s\n", line)
			os.Exit(1)
		}

		p := newProvider(string(line))
		if p == nil {
			fmt.Fprintf(os.Stderr, "Invalid input format: %q\n", line)
			os.Exit(1)
		}

		if nameLength < len(p.name) {
			nameLength = len(p.name)
		}

		ps = append(ps, *p)
	}

	nameLength++

	return ps, nameLength
}

type display struct {
	ps     []provider
	format struct {
		prefix     string
		suffix     string
		line       string
		skipLength int
	}
}

func newDisplay(opts ...func(*display)) *display {
	d := display{}
	for _, opt := range opts {
		opt(&d)
	}
	return &d
}

func (d *display) update() {
	for j := 0; j < len(d.ps); j++ {
		os.Stdout.Write(up)
	}
	for _, p := range d.ps {
		fmt.Fprintf(os.Stdout, "\r")
		c, t := Code(p.secret)
		if t == period {
			fmt.Fprintf(os.Stdout, d.format.line, p.name, c, t)
		} else {
			fmt.Fprintf(os.Stdout, "%s[%dC(%ds) ", esc, d.format.skipLength, t)
			os.Stdout.Write(down)
		}
	}
}

const (
	keyEscape = 27
)

var (
	up    = []byte{keyEscape, '[', 'A'}
	down  = []byte{keyEscape, '[', 'B'}
	clear = []byte{keyEscape, '[', '2', 'K'}
	esc   = []byte{keyEscape}
)

func (d *display) fullRender() {
	for _, p := range d.ps {
		c, t := Code(p.secret)
		fmt.Fprintf(os.Stdout, d.format.line, p.name, c, t)
	}
}

func (d *display) run() {
	d.fullRender()
	go func() {
		for {
			time.Sleep(1000 * time.Millisecond)
			d.update()
		}
	}()
}

