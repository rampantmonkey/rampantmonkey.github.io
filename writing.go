package main

import (
	"bytes"
	"fmt"
	"github.com/russross/blackfriday/v2"
	"html/template"
	"io/ioutil"
	"os"
	"path"
	"sort"
	"strings"
	"time"
)

type WritingPost struct {
	Title string
	Slug string
	PublicationDate time.Time
	RawContent []byte
	Description string
	ExternalLink string
}

func fromFile(path string, slug string) WritingPost {
	wp := WritingPost {}
	wp.Slug = slug
	content, err := ioutil.ReadFile(path)
	if err != nil {
		fmt.Printf("Error reading post content: %v\n", err)
		return wp
	}

	r := bytes.NewBuffer(content)
	bytesRead := 0
	for {
		line, err := r.ReadBytes('\n')
		if err != nil {
			break
		}
		// if line starts with : -> it is a command
		// else -> this line and the rest of the file is the actual content...
		if line[0] == ':' {
			fields := strings.Fields(string(line[1:]))
			switch fields[0] {
			case "title":
				wp.Title = strings.Join(fields[1:], " ")
			case "description":
				wp.Description = strings.Join(fields[1:], " ")
			case "date":
				date, err := time.Parse("2006-01-02", strings.Join(fields[1:], " "))
				if err == nil {
					wp.PublicationDate = date
				} else {
					fmt.Printf("Error parsing publication date in %s: %v\n", path, err)
				}
			case "external":
				wp.ExternalLink = strings.Join(fields[1:], " ")
			}
			// this line is a command
			bytesRead += len(line)
			continue
		} else {
			break
		}
	}

	wp.RawContent = []byte(strings.Replace(string(content[bytesRead:]), "\r\n", "\n", -1)) // (╯°□°)╯︵ ┻━┻

	return wp
}

func (wp WritingPost) render() template.HTML {
	return template.HTML(
		fmt.Sprintf("<h1>%s</h1>\n<hr />\n", wp.Title) +
		string(blackfriday.Run(wp.RawContent,
			   blackfriday.WithExtensions(blackfriday.Footnotes | blackfriday.LaxHTMLBlocks | blackfriday.FencedCode),
			   )))
}

func BuildBlog(inPath string, outDir string, pageLayout *template.Template) {
	files, err := os.ReadDir(inPath)
	if err != nil {
		fmt.Printf("Error reading directory: %v\n", err)
		return
	}

	os.Mkdir(outDir, 0755)

	var posts []WritingPost

	for _, f := range files {
		if f.IsDir() {
			subpath := path.Join(inPath, f.Name())
			subfiles, err := os.ReadDir(subpath)
			if err != nil {
				fmt.Printf("Error reading directory: %v\n", err)
				return
			}

			subOutDir := path.Join(outDir, f.Name())
			os.Mkdir(subOutDir, 755)

			for _, sf := range subfiles {
				if strings.HasSuffix(sf.Name(), ".md") {
					post := fromFile(path.Join(subpath, sf.Name()), strings.TrimSuffix(sf.Name(), ".md"))
					posts = append(posts, post)
					fd, err := os.OpenFile(path.Join(subOutDir, "index.html"), os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0600)
					if err != nil {
						fmt.Printf("Error opening output file: %v\n", err)
						return
					}
					post.render()
					pageLayout.Execute(fd, Page{Title: post.Title, Content: post.render()})
					fd.Close()
				} else {
					copyFile(path.Join(subpath, sf.Name()), path.Join(subOutDir, sf.Name()))
				}
			}
		}

		if strings.HasSuffix(f.Name(), ".md") {
			subOutDir := path.Join(outDir, strings.TrimSuffix(f.Name(), ".md"))
			os.Mkdir(subOutDir, 755)
			post := fromFile(path.Join(inPath, f.Name()), strings.TrimSuffix(f.Name(), ".md"))
			posts = append(posts, post)
			fd, err := os.OpenFile(path.Join(subOutDir, "index.html"), os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0600)
			if err != nil {
				fmt.Printf("Error opening output file: %v\n", err)
				return
			}
			pageLayout.Execute(fd, Page{Title: post.Title, Content: post.render()})
			fd.Close()
		}
	}

	sort.Slice(posts, func(i, j int) bool {
		return posts[i].PublicationDate.After(posts[j].PublicationDate)
	})

	rendered := "<h1>Posts</h1>\n<hr />\n<ul class=\"blog-list\">"
	for _, p := range posts {
		if(p.ExternalLink != "") { // The posts should just be my own stuff. The external links are a replacement for social media.
			continue
		}

		rendered += fmt.Sprintf("  <li>%s - <a href=\"/writing/%s\">%s</a></li>", p.PublicationDate.Format("2006-01-02"), p.Slug, p.Title)

		fmt.Printf("- %s\n", p.Title)
	}
	rendered += "</ul>"

	fd, err := os.OpenFile(path.Join(outDir, "index.html"), os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0600)
	if err != nil {
		fmt.Printf("Error opening output file: %v\n", err)
		return
	}
	pageLayout.Execute(fd, Page{Title: siteName + " - Blog", Content: template.HTML(rendered)})
}

// blog directory structure is either "markdown file representing post or directory containing markdown file and static assets"
// output structure -> directory named for post slug that contains an "index.html" file rendered with the template and markdown content and any other static files that were in the same directory.
// walk "writing" directory. for each md file -> create a blog post. for each directory -> create blog post and copy assets.
