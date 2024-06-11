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
	Category string
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
		if line[0] == ':' {
			fields := strings.Fields(string(line[1:]))
			cmd := fields[0]
			payload := strings.Join(fields[1:], " ")
			switch cmd {
			case "title":
				wp.Title = payload
			case "description":
				wp.Description = payload
			case "date":
				date, err := time.Parse("2006-01-02", payload)
				if err == nil {
					wp.PublicationDate = date
				} else {
					fmt.Printf("Error parsing publication date in %s: %v\n", path, err)
				}
			case "external":
				wp.ExternalLink = payload
			case "category":
				wp.Category = payload
			}

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

type Category struct {
	Title string
	LatestPublicationDate time.Time
	Posts []WritingPost
}

func BuildBlog(inPath string, outDir string, pageLayout *template.Template) {
	files, err := os.ReadDir(inPath)
	if err != nil {
		fmt.Printf("Error reading directory: %v\n", err)
		return
	}

	os.Mkdir(outDir, 0755)

	categoryPosts := map[string][]WritingPost{}

	for _, f := range files {
		if f.IsDir() {
			subpath := path.Join(inPath, f.Name())
			subfiles, err := os.ReadDir(subpath)
			if err != nil {
				fmt.Printf("Error reading directory: %v\n", err)
				return
			}

			subOutDir := path.Join(outDir, f.Name())
			os.Mkdir(subOutDir, 0755)

			for _, sf := range subfiles {
				if strings.HasSuffix(sf.Name(), ".md") {
					post := fromFile(path.Join(subpath, sf.Name()), strings.TrimSuffix(sf.Name(), ".md"))
					categoryPosts[post.Category] = append(categoryPosts[post.Category], post)
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
			os.Mkdir(subOutDir, 0755)
			post := fromFile(path.Join(inPath, f.Name()), strings.TrimSuffix(f.Name(), ".md"))
			categoryPosts[post.Category] = append(categoryPosts[post.Category], post)
			fd, err := os.OpenFile(path.Join(subOutDir, "index.html"), os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0600)
			if err != nil {
				fmt.Printf("Error opening output file: %v\n", err)
				return
			}
			pageLayout.Execute(fd, Page{Title: post.Title, Content: post.render()})
			fd.Close()
		}
	}

	rendered := "<h1>Posts</h1>\n<hr />\n"
	categories := make([]Category, 0, len(categoryPosts))
	for c, posts := range categoryPosts {
		sort.Slice(posts, func(i, j int) bool {
			return posts[i].PublicationDate.After(posts[j].PublicationDate)
		})
		categories = append(categories, Category{c, posts[0].PublicationDate, posts})
	}
	sort.Slice(categories, func(i, j int) bool {
		return categories[i].LatestPublicationDate.After(categories[j].LatestPublicationDate)
	})


	for _, cat := range categories {
		rendered += fmt.Sprintf("<h2>%s</h2>\n", cat.Title)
		rendered += "<ul class=\"blog-list\">\n"
		for _, p := range cat.Posts {
			if(p.ExternalLink != "") { // The posts should just be my own stuff. The external links are a replacement for social media.
				continue
			}

			rendered += fmt.Sprintf("  <li>%s - <a href=\"/writing/%s/\">%s</a></li>", p.PublicationDate.Format("2006-01-02"), p.Slug, p.Title)

			//fmt.Printf("- %s\n", p.Title)
		}
		rendered += "</ul>"
	}

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
