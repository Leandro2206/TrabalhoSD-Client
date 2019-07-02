import { Component, OnInit, ViewChild } from '@angular/core';
import { JogoService } from '../jogo.service';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Jogo } from '../jogo';
import { Categoria } from '../categoria';
import { CategoriaService } from '../categoria.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-jogo',
  templateUrl: './jogo.component.html',
  styleUrls: ['./jogo.component.css']
})
export class JogoComponent implements OnInit {

  jogoForm: FormGroup = this.fb.group({
    _id: [null],
    nome: ['', [Validators.required]],
    desenvolvedora: ['', [Validators.required]],
    nota: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
    categorias: [[], [Validators.required]]
  });

  jogos: Jogo[] = [];
  categorias: Categoria[] = [];

  @ViewChild('form', { static: false }) form: NgForm;

  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private jogoService: JogoService,
    private categoriaService: CategoriaService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.jogoService.get()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((jogs) => this.jogos = jogs);

    this.categoriaService.get()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((categs) => this.categorias = categs);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
  }

  salvar() {
    let dado = this.jogoForm.value;
    if (dado._id != null) {
      this.jogoService.update(dado)
        .subscribe(
          (j) => this.notificar("Jogo Atualizado!")
        );
    }
    else {
      this.jogoService.add(dado)
        .subscribe(
          (j) => this.notificar("Jogo Cadastrado!")
        );
    }
    this.resetarFormulario();
  }

  editar(j: Jogo) {
    this.jogoForm.setValue(j);
  }

  deletar(j: Jogo) {
    this.jogoService.del(j)
      .subscribe(
        () => this.notificar("Jogo Deletado!"),
        (err) => console.log(err)
      )
  }

  notificar(msg: string) {
    this.snackBar.open(msg, "Ok", { duration: 5000 });
  }

  resetarFormulario() {
    // this.jogoForm.reset();
    this.form.resetForm();
  }
}
