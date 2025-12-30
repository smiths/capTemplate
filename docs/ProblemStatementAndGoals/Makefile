# Makefile
# From https://danielkaes.wordpress.com/2009/03/14/compiling-latex-documents-using-makefiles/

TEX=pdflatex
BIBTEX=bibtex
BUILDTEX=$(TEX) $<

# Default target: builds the PDF
all: ProblemStatement.pdf

%.pdf: %.tex
	$(TEX) $<
#	$(BIBTEX) $<
#	BUILDTEX
	$(TEX) $<

clean-all:
	rm -f *.dvi *.log *.bak *.aux *.bbl *.blg *.idx *.ps *.eps *.pdf *.toc *.out *~

clean:
	rm -f *.log *.bak *.aux *.bbl *.blg *.idx *.toc *.out *~
