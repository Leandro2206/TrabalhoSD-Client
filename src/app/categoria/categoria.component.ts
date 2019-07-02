import { Component, OnInit } from '@angular/core';
import { Categoria } from '../categoria';
import { CategoriaService } from '../categoria.service';
import { MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent implements OnInit {

  categorias: Categoria[] = [];
  categoriaNome: string = '';
  categoriaEditar: Categoria = null;
  private unsubscribe$: Subject<any> = new Subject();

  constructor(
    private categoriaService: CategoriaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.categoriaService.get()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((categs) => this.categorias = categs);
  }

  salvar() {
    if (this.categoriaEditar) {
      this.categoriaService.update(
        { nome: this.categoriaNome, _id: this.categoriaEditar._id })
        .subscribe(
          (categ) => {
            this.notificar('Categoria Atualizada!');
          },
          (err) => {
            this.notificar("Erro!");
            console.error(err);
          }
        )
    }
    else {
      this.categoriaService.add({ nome: this.categoriaNome })
        .subscribe(
          (categ) => {
            console.log(categ);
            this.notificar('Categoria Cadastrada!');
          },
          (err) => console.error(err))
    }
    this.limparCampo();
  }

  editar(categ: Categoria) {
    this.categoriaNome = categ.nome;
    this.categoriaEditar = categ;
  }

  deletar(categ: Categoria) {
    this.categoriaService.del(categ)
      .subscribe(
        () => this.notificar('Categoria Removida!'),
        (err) => this.notificar(err.error.msg)
      )
  }

  limpar() {
    this.limparCampo();
  }

  limparCampo() {
    this.categoriaNome = '';
    this.categoriaEditar = null;
  }

  notificar(msg: string) {
    this.snackBar.open(msg, "Ok", { duration: 3000 });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
  }
}