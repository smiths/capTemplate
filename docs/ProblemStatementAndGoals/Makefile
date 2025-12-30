# Makefile
# From https://danielkaes.wordpress.com/2009/03/14/compiling-latex-documents-using-makefiles/

PROJECT=ProblemStatement
TEX=pdflatex
BIBTEX=bibtex
BUILDTEX=$(TEX) $(PROJECT).tex

# Default target: builds the PDF
all: $(PROJECT).pdf

# Rule to create the PDF from the TeX file
$(PROJECT).pdf: $(PROJECT).tex
	$(BUILDTEX)
#	$(BIBTEX) $(PROJECT)
#	$(BUILDTEX)
	$(BUILDTEX)

clean-all:
	rm -f *.dvi *.log *.bak *.aux *.bbl *.blg *.idx *.ps *.eps *.pdf *.toc *.out *~

clean:
	rm -f *.log *.bak *.aux *.bbl *.blg *.idx *.toc *.out *~
