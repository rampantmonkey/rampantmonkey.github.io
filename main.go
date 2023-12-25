package main

import (
	"fmt"
	"html/template"
	"io"
	"io/ioutil"
	"os"
	"path"
	"strings"
	"time"
)

type Page struct {
	Title string
	Content template.HTML
}

const outDir = "rendered"
const siteName = "Casey Robinson"

func copyFile (src string, dst string) error {
	srcfd, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcfd.Close()

	dstfd, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer dstfd.Close()

	if _, err := io.Copy(dstfd, srcfd); err != nil {
		return err
	}
	srcinfo, err := os.Stat(src)
	if err != nil {
		return err
	}
	return os.Chmod(dst, srcinfo.Mode())
}

func copyDir (src string, dst string) error {
	srcinfo, err := os.Stat(src)
	if err != nil {
		return err
	}

	if err = os.MkdirAll(dst, srcinfo.Mode()); err != nil {
		return err
	}

	fds, err := ioutil.ReadDir(src)
	if err != nil {
		return err
	}

	for _, fd := range fds {
		srcfp := path.Join(src, fd.Name())
		dstfp := path.Join(dst, fd.Name())

		if fd.IsDir() {
			if err = copyDir(srcfp, dstfp); err != nil {
				fmt.Println(err)
			}
		} else {
			if err = copyFile(srcfp, dstfp); err != nil {
				fmt.Println(err)
			}
		}
	}
	return nil
}

func buildeverything() {
	fmt.Printf("Building everything...\n")
	os.RemoveAll(outDir)
	os.Mkdir(outDir, 0755)
	err := copyFile("main.css", path.Join(outDir, "main.css"))
	if err != nil {
		fmt.Printf("Error copying file: %v\n", err)
		return
	}

	err = copyDir("images", path.Join(outDir, "images"))
	if err != nil {
		fmt.Printf("Error copying directory: %v\n", err)
		return
	}

	err = copyDir("files", path.Join(outDir, "files"))
	if err != nil {
		fmt.Printf("Error copying directory: %v\n", err)
		return
	}

	cwd, err := os.Getwd()
	if err != nil {
		fmt.Printf("Error getting working directory: %v\n", err)
		return
	}

	layout := template.Must(template.ParseFiles("layout.html.tmpl"))

	files, err := os.ReadDir(cwd)
	if err != nil {
		fmt.Printf("Error reading directory: %v\n", err)
		return
	}

	for _, f := range files {
		if strings.HasSuffix(f.Name(), "html") {
			var page Page
			if f.Name() == "index.html" {
				page.Title = siteName
			} else {
				page.Title = siteName + " - " + strings.Title(strings.TrimSuffix(f.Name(), ".html"))
			}

			content, err := ioutil.ReadFile(path.Join(cwd, f.Name()))
			if err != nil {
				fmt.Printf("Error reading page content: %v\n", err)
			}

			page.Content = template.HTML(string(content))

            if f.Name() == "index.html" {
				fd, err := os.OpenFile(path.Join(outDir, "index.html"), os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0755)
				if err != nil {
					fmt.Printf("Error opening output file: %v\n", err)
					return
				}
				layout.Execute(fd, page)
				fd.Close()
                        } else {
				os.Mkdir(path.Join(outDir, strings.TrimSuffix(f.Name(), ".html")), 0755)
				fd, err := os.OpenFile(path.Join(outDir, strings.TrimSuffix(f.Name(), ".html"), "index.html"), os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0755)
				if err != nil {
					fmt.Printf("Error opening output file: %v\n", err)
					return
				}
				layout.Execute(fd, page)
				fd.Close()
            }
		}
	}

	BuildBlog(path.Join(cwd, "writing"), path.Join(outDir, "writing"), layout)
}

func main() {
	if len(os.Args) > 1  && os.Args[1] == "serve" {
		ticker := time.NewTicker(5 * time.Second)
		quit := make(chan struct{})
		go func() {
			for {
				select {
				case <- ticker.C:
					buildeverything()
				case <- quit:
					ticker.Stop()
					return
				}
			}
		}()
		serve()
		return
	}

	buildeverything()
}
