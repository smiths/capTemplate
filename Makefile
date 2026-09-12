# Makefile for compiling .tex files

# Define the pdflatex command
# -recorder makes pdflatex write a .fls listing every file it read, which
# is what record_deps.py turns into the dependency manifest.
PDFLATEX_CMD = pdflatex -interaction=nonstopmode -recorder

# Define the pandoc command, for teams who author a document in Markdown
# instead of LaTeX. Uses the pdflatex already installed for the .tex rule.
PANDOC_CMD = pandoc --pdf-engine=pdflatex --toc -V geometry:margin=1in

# Define the compile step for pdflatex
define COMPILE_TEX
	cd $(dir $1) && $(PDFLATEX_CMD) $(notdir $1) || { echo "Error: pdflatex failed for $1"; exit 1; }
endef

# Define the bibtex command
BIBTEX_CMD = [ -f $(basename $(notdir $1)).aux ] && bibtex $(basename $(notdir $1)) || echo "No bibtex references found" || { echo "Error: bibtex failed for $1"; exit 1; }

# Define the compile step for bibtex
define COMPILE_BIBTEX
	cd $(dir $1) && $(BIBTEX_CMD)
endef

# Default target: Compile all .tex files if no specific target is given
all: $(patsubst %.tex, %.pdf, $(wildcard **/*.tex))

# Rule for compiling .md to .pdf.
# NOTE: this rule is deliberately listed BEFORE the .tex rule. When a folder
# contains both Foo.md and Foo.tex, GNU make picks the first matching pattern
# rule whose prerequisite exists, so Markdown wins the collision.
%.pdf: %.md
	@echo "Compiling $< to $@ with pandoc"
	cd $(dir $<) && $(PANDOC_CMD) $(notdir $<) -o $(notdir $@)

# Rule for compiling .tex to .pdf
%.pdf: %.tex
	@echo "Compiling $< to $@"
	$(call COMPILE_TEX,$<)
	$(call COMPILE_BIBTEX,$<)
	$(call COMPILE_TEX,$<)
	$(call COMPILE_TEX,$<)

# Clean generated files
clean:
	find . -name "*.aux" -o -name "*.log" -o -name "*.pdf" -o -name "*.toc" -o -name "*.out" -o -name "*.bbl" -o -name "*.blg" -exec rm -f {} +

.PHONY: all clean